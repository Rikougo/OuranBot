import Collection from "@discordjs/collection";
import { AudioPlayerStatus, AudioResource, DiscordGatewayAdapterCreator, entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { Snowflake } from "discord-api-types";
import { ButtonInteraction, CommandInteraction, GuildMember, Interaction, MessageActionRow, MessageButton, MessageEmbed, VoiceChannel } from "discord.js";
import { Ene } from "../Ene";
import { MusicSubscription } from "./music/Subscription";
import { Track } from "./music/Track";

import youtubeSearch, { YouTubeSearchResults } from "youtube-search";

export class AudioManager {
	static YOUTUBE_REGEX : RegExp = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;

    private players : Collection<Snowflake, MusicSubscription>;
	public holded_queue : Collection<string, YouTubeSearchResults[]>;

    constructor() {
        this.players = new Collection();
		this.holded_queue = new Collection();
    }

	async select_holded(client: Ene, interaction: ButtonInteraction) {
		const [id, index] = interaction.customId.split("_");

		if (!this.holded_queue.has(id)) return;

		const item = this.holded_queue.get(id)![parseInt(index) - 1];

		const track = await Track.from(item.link, {
			onStart() {
				interaction.editReply('Now playing.').catch(console.warn);
			},
			onFinish() {
				interaction.editReply('Track ended.').catch(console.warn);
			},
			onError(error) {
				interaction.editReply(`Error: ${error.message}`).catch(console.warn);
			},
		});

		const embed = new MessageEmbed()
			.setTitle("Enqueued")
			.setFooter(client.user?.username || "???", client.user?.avatarURL() || undefined)
			.setColor("#1f1f1f")
			.setThumbnail(item.thumbnails.default!.url)
			.setDescription(`[${item.title}](${item.link})`);

		// Enqueue the track and reply a success message to the user
		let subscription = this.players.get(interaction.guild?.id!)!;
		subscription.enqueue(track);
		await interaction.update({components: [], embeds: [embed]});
	}

    async play(client: Ene, interaction: CommandInteraction) : Promise<void> {
        await interaction.deferReply();

        let subscription = this.players.get(interaction.guild?.id!);
        const url = interaction.options.get("song")!.value! as string;

        // If a connection to the guild doesn't already exist and the user is in a voice channel, join that channel
		// and create a subscription.
		if (!subscription) {
			if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
				const channel = interaction.member.voice.channel;
				subscription = new MusicSubscription(
					joinVoiceChannel({
						channelId: channel.id,
						guildId: channel.guild.id,
						adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
					}),
				);
				subscription.voiceConnection.on('error', console.warn);
				this.players.set(interaction.guild?.id!, subscription);
			}
		}

		// If there is no subscription, tell the user they need to join a channel.
		if (!subscription) {
			await interaction.editReply('Join a voice channel and then try that again!');
			return;
		}

        // Make sure the connection is ready before processing the user's request
		try {
			await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
		} catch (error) {
			console.warn(error);
			await interaction.editReply('Failed to join voice channel within 20 seconds, please try again later!');
			return;
		}

		try {
			if (!AudioManager.YOUTUBE_REGEX.test(url)) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton().setCustomId(`${interaction.id}_1`).setLabel("1").setStyle("PRIMARY"),
						new MessageButton().setCustomId(`${interaction.id}_2`).setLabel("2").setStyle("PRIMARY"),
						new MessageButton().setCustomId(`${interaction.id}_3`).setLabel("3").setStyle("PRIMARY"),
						new MessageButton().setCustomId(`${interaction.id}_4`).setLabel("4").setStyle("PRIMARY"),
						new MessageButton().setCustomId(`${interaction.id}_5`).setLabel("5").setStyle("PRIMARY")
					);

				const R = await youtubeSearch(url, {maxResults: 5, key: client._youtube_key});
				let desc : string = "";

				this.holded_queue.set(interaction.id, R.results!);

				let embed = new MessageEmbed()
						.setTitle(`Result for ${url}`)
						.setFooter(client.user?.username || "???", client.user?.avatarURL() || undefined)
						.setColor("#1f1f1f")
						.setThumbnail(R.results[0].thumbnails.default!.url);
					
				R.results!.forEach((result, index) => {
					desc += `**[${index+1}]** [${result.title}](${result.link})\n`;
				});

				embed.setDescription(desc);
				
				await interaction.editReply({embeds: [embed], components: [row]});
			} else {
				// Attempt to create a Track from the user's video URL
				const track = await Track.from(url, {
					onStart() {
						interaction.editReply('Now playing.').catch(console.warn);
					},
					onFinish() {
						interaction.editReply('Track ended.').catch(console.warn);
					},
					onError(error) {
						interaction.editReply(`Error: ${error.message}`).catch(console.warn);
					},
				});
				// Enqueue the track and reply a success message to the user
				subscription.enqueue(track);
				await interaction.editReply(`Enqueued **${track.title}**`);
			}
		} catch (error) {
			console.warn(error);
			await interaction.editReply('Failed to play track, please try again later!');
		}
    }

    async skip(client: Ene, interaction: CommandInteraction) : Promise<void> {
        let subscription = this.players.get(interaction.guild?.id!);

        if (subscription) {
			// Calling .stop() on an AudioPlayer causes it to transition into the Idle state. Because of a state transition
			// listener defined in music/subscription.ts, transitions into the Idle state mean the next track from the queue
			// will be loaded and played.
			subscription.audioPlayer.stop();
			await interaction.reply('Skipped song!');
		} else {
			await interaction.reply('Not playing in this server!');
		}
    }

    async queue(client: Ene, interaction: CommandInteraction) : Promise<void> {
        let subscription = this.players.get(interaction.guild?.id!);

        if (subscription) {
			const current =
				subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
					? `Nothing is currently playing!`
					: `Playing **${(subscription.audioPlayer.state.resource as AudioResource<Track>).metadata.title}**`;

			const queue = subscription.queue
				.slice(0, 5)
				.map((track, index) => `**[${index + 1}]** [${track.title}](${track.url})`);

			let embed = new MessageEmbed()
				.setTitle(`Queue for ${interaction.guild?.name || "???"}`)
				.setFooter(client.user?.username || "???", client.user?.avatarURL() || undefined)
				.setColor("#1f1f1f")
				.setDescription(current + "\n\n" + queue.join("\n"));
				
			await interaction.reply({embeds: [embed]});
		} else {
			await interaction.reply('Not playing in this server!');
		}
    }

    async pause(client: Ene, interaction: CommandInteraction) : Promise<void> {
        let subscription = this.players.get(interaction.guild?.id!);

        if (subscription) {
			subscription.audioPlayer.pause();
			await interaction.reply({ content: `Paused!`, ephemeral: false });
		} else {
			await interaction.reply('Not playing in this server!');
		}
    }

    async resume(client: Ene, interaction: CommandInteraction) : Promise<void> {
        let subscription = this.players.get(interaction.guild?.id!);

        if (subscription) {
			subscription.audioPlayer.unpause();
			await interaction.reply({ content: `Unpaused!`, ephemeral: false });
		} else {
			await interaction.reply('Not playing in this server!');
		}
    }

    async leave(client: Ene, interaction: CommandInteraction) : Promise<void> {
        let subscription = this.players.get(interaction.guild?.id!);

        if (subscription) {
			subscription.voiceConnection.destroy();
			this.players.delete(interaction.guild?.id!);
			await interaction.reply({ content: `Left channel!`, ephemeral: false });
		} else {
			await interaction.reply('Not playing in this server!');
		}
    }
}