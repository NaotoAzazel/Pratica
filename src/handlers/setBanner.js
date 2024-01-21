import Canvas from "canvas";

function createBanner(client) {
  console.log("Start creating banner");

  try {
    async function banner() {
      const { GUILD_ID: guildId } = process.env;
      const guild = client.guilds.cache.get(guildId);
      const memberCount = guild.memberCount;
      const membersInVoice = 0;

      voiceChannel
        .filter((x) => x.type === 2)
        .map(async (channel) => {
          const m = channel.members;
          membersInVoice += m.size;
        });

      const canvas = Canvas.createCanvas(914, 514);
      const ctx = canvas.getContext("2d");

      const avatarBack = await Canvas.loadImage(
        "https://media.discordapp.net/attachments/977668660317524018/1195789530498863254/2-.png"
      );
      const placeHolder = await Canvas.loadImage(
        "https://media.discordapp.net/attachments/977668660317524018/1195790663183241297/2-1.png"
      );

      ctx.drawImage(avatarBack, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(placeHolder, 0, 0, canvas.width, canvas.height);

      ctx.textAlign = "center";
      ctx.font = "37px Rubik";
      ctx.fillStyle = "#000000";

      const height = 440;

      ctx.fillText(String(memberCount), 765, height);
      ctx.fillText(`${membersInVoice}`, 90, height);

      return canvas.toBuffer();
    }

    setInterval(async () => {
      const image = await banner();
      
      guild.setBanner(image).catch((err) => {
        console.log("ServerBannerError", err.stack);
      });
    }, 60000);

    return true;
  } catch (err) {
    console.log(err);
  }
}

export default createBanner;
