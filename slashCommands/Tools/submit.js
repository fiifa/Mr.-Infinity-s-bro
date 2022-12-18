const Discord = require('discord.js')
module.exports = {
  name: "harmfullink", 
  description: "Submit!",
  timeout: 5000,
  options: [
    {
      name: "link",
      description: "?",
      required: true,
      type: 3
    }
  ],

  run: async (interaction, client) => {
    const { options, member } = interaction;
    const link = options.getString("link");



    const channel = interaction.guild.channels.cache.get(" ");
    if (!channel) return await interaction.reply({ content: "404.", ephemeral: true }).catch(err => console.log(err))

    
    try {
      var msg = await channel.send({
        embeds: [
          new Discord.MessageEmbed()




            .setAuthor({ name: `${interaction.user.tag}`, iconURL: `${interaction.member.displayAvatarURL({ dynamic: true })}` })
            .setColor('#FFF000')
            .setTitle('Harmfullink sended!')
          .addField(`Harmful link:`, `${link}`)
            
            

        ],
        content: " "
      });
      

      await interaction.reply({ content: "✅ | Thank you! A dangerous link has been sent to our Staff members for review. ", ephemeral: true }).catch(err => console.log(err))


    } catch (e) {
      console.log(e)
      return await interaction.reply({ content: "404", ephemeral: true }).catch(err => console.log(err))
    }
  }
}  
