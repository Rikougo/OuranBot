import { argv, env } from "process";
import { Ene } from "./Ene";

import { createInterface } from "readline";

const ene : Ene = new Ene();

const readline = createInterface({
    input: process.stdin,
    output: process.stdout
});
   
readline.question('1.run 2.register :\n\t> ', (input: any) => {
    if (input === "1") {
        console.log("Running.")
        ene.run();
    } else if(input === "2") {
        console.log("Registering.")
        ene.register().then(() => console.log("Done"));
    } else {
        console.log("Wrong input");
    }
});