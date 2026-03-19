const { Client, GatewayIntentBits, Partials, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel],
});

const TICKET_CHANNEL = '1484291971244757215';
const TICKET_CATEGORY = '1484291931373572096';
const CLAIM_ROLE = '1484217404140683316';
const ADD_ROLE_ON_CLAIM = '1484213244007682191';

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Optional: Post the ticket embed automatically if not posted
    const channel = await client.channels.fetch(TICKET_CHANNEL);
    const embed = new EmbedBuilder()
        .setTitle('[T.ASTRA] TICKET')
        .setDescription('Open a ticket to buy, apply for selling, report a product issue, or other.')
        .setColor('Blue');

    const channel = await client.channels.fetch('1484291971244757215'); // your ticket channel ID

const embed = new EmbedBuilder()
    .setTitle('[T.ASTRA] TICKET')
    .setDescription('Open a ticket to buy, apply for selling, report a product issue, or other.')
    .setColor('Blue');

const select = new StringSelectMenuBuilder()
    .setCustomId('ticket-select')
    .setPlaceholder('Select an option')
    .addOptions([
        { label: 'BUY', value: 'buy', emoji: '💰' },
        { label: 'SELL', value: 'sell', emoji: '🛒' },
        { label: 'Product invalid', value: 'invalid', emoji: '❌' },
        { label: 'Other', value: 'other', emoji: '📝' },
    ]);

const button = new ButtonBuilder()
    .setCustomId('ticket-open')
    .setLabel('Open')
    .setStyle(ButtonStyle.Success);

await channel.send({
    embeds: [embed],
    components: [
        new ActionRowBuilder().addComponents(select),
        new ActionRowBuilder().addComponents(button)
    ]
});

    const select = new StringSelectMenuBuilder()
        .setCustomId('ticket-select')
        .setPlaceholder('Select an option')
        .addOptions([
            { label: 'BUY', value: 'buy', emoji: '💰' },
            { label: 'SELL', value: 'sell', emoji: '🛒' },
            { label: 'Product invalid', value: 'invalid', emoji: '❌' },
            { label: 'Other', value: 'other', emoji: '📝' },
        ]);

    const button = new ButtonBuilder()
        .setCustomId('ticket-open')
        .setLabel('Open')
        .setStyle(ButtonStyle.Success);

    // Only post if channel is empty, or you can manually send once
    // await channel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(select), new ActionRowBuilder().addComponents(button)] });
});

const tickets = new Map(); // track tickets

client.on('interactionCreate', async (interaction) => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket-select') {
        tickets.set(interaction.user.id, interaction.values[0]);
        await interaction.reply({ content: `Selected: ${interaction.values[0]}`, ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'ticket-open') {
        const selection = tickets.get(interaction.user.id);
        if (!selection) return interaction.reply({ content: 'Please select an option first!', ephemeral: true });

        // Generate random 3-digit ticket number
        const ticketNumber = Math.floor(100 + Math.random() * 900);
        const ticketName = `${ticketNumber}-ticket`;

        const guild = interaction.guild;
        const category = guild.channels.cache.get(TICKET_CATEGORY);

        // Create channel with permissions
        const ticketChannel = await guild.channels.create({
            name: ticketName,
            type: 0, // GUILD_TEXT
            parent: category,
            permissionOverwrites: [
                { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: CLAIM_ROLE, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            ],
        });

        await interaction.reply({ content: `Ticket created: ${ticketChannel}`, ephemeral: true });

        await ticketChannel.send({
            content: `<@&${CLAIM_ROLE}>`,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Ticket #${ticketNumber}`)
                    .setDescription(`Type: **${selection.toUpperCase()}**\nCreator: <@${interaction.user.id}>`)
                    .setColor('Green'),
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('ticket-claim').setLabel('Claim').setStyle(ButtonStyle.Primary)
                ),
            ],
        });
    }

    if (interaction.isButton() && interaction.customId === 'ticket-claim') {
        const channel = interaction.channel;

        // Only allow CLAIM_ROLE to claim
        if (!interaction.member.roles.cache.has(CLAIM_ROLE)) {
            return interaction.reply({ content: 'You cannot claim this ticket!', ephemeral: true });
        }

        // Give claim role access + add additional role to view
        await channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: true, SendMessages: true });
        await channel.permissionOverwrites.edit(ADD_ROLE_ON_CLAIM, { ViewChannel: true, SendMessages: true });

        await interaction.reply({ content: `You claimed this ticket!`, ephemeral: true });
        await channel.send({ content: `<@${interaction.user.id}> claimed the ticket!` });
    }
});

client.login(process.env.TOKEN);
