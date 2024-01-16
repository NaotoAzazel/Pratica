import fs from "fs";
import ascii from "ascii-table";

export default async function loadCommands(client) {
  const table = new ascii().setHeading("Commands", "Status");
  const folders = fs.readdirSync("src/commands"); 
  let commandsArray = [];

  if(!folders.length) {
    return console.log("Couldn't find the folders in src/commands");
  }

  for(const folder of folders) {
    const files = await fs.promises.readdir(`src/commands/${folder}`);
    const jsFiles = files.filter((file) => file.endsWith(".js"));
    if(!files.length) {
      return console.log("Couldn't find the files in src/commands/")
    }

    for(const file of jsFiles) {
      const { default: commandFile } = await import(`../commands/${folder}/${file}`);

      client.commands.set(commandFile.data.name, commandFile);
      commandsArray.push(commandFile.data.toJSON());

      table.addRow(file, "loaded");
      continue;
    }
  }

  client.application.commands.set(commandsArray);
  return console.log(table.toString())
}