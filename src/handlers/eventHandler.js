import fs from "fs";
import ascii from "ascii-table";

export default async function loadEvents(client) {
  const table = new ascii().setHeading("Events", "Status");
  const folders = await fs.promises.readdir("src/events"); 
  
  if(!folders.length) {
    return console.log("Couldn't find the folders in src/events");
  }
  
  for(const folder of folders) {
    const files = await fs.promises.readdir(`src/events/${folder}`);
    const jsFiles = files.filter((file) => file.endsWith(".js"));

    if(!files.length) {
      return console.log("Couldn't find the files in src/events/")
    }

    for (const file of jsFiles) {
      const { default: event } = await import(`../events/${folder}/${file}`);

      const eventListener = event.rest ? client.rest : client;
      const eventExecute = (...args) => event.execute(...args, client);
    
      eventListener[event.once ? "once" : "on"](event.name, eventExecute);
      table.addRow(file, 'loaded');
    }
  }

  return console.log(table.toString());
}