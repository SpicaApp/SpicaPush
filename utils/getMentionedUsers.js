const axios = require("axios").default;

module.exports = async (content, authorId) => {
    const splittedContent = content.replace(/\n/g, " ").split(" ");

    var mentionedIds = [];

    for (var i = 0; i < splittedContent.length; i++) {
        const filteredSplittedContent = splittedContent[i].replace(/[^a-zA-Z0-9-@]/g, '');
        if (filteredSplittedContent.startsWith("@")) {
            const filteredMention = filteredSplittedContent.replace(/[^a-zA-Z0-9-]/g, '');

            try { // Check if the mention is a username
                const usernameData = await axios.get(`https://micro.alles.cx/api/username/${filteredMention}`)
                const userById = await getUserById(usernameData.data.id);
                if (userById !== undefined) {
                    mentionedIds.push(userById.id);
                }
                else {
                    const userById = await getUserById(filteredMention);
                    if (userById !== undefined) mentionedIds.push(userById.id);
                }
            }
            catch (err) { // Ok it wasn't a username, hopefully it's an id
                const userById = await getUserById(filteredMention);
                if (userById !== undefined) mentionedIds.push(userById.id);
            }

        }
    }
    
    const filteredMentions = [... new Set(mentionedIds)];
    const authorIndex = filteredMentions.indexOf(authorId);
    if (authorIndex > -1) {
        filteredMentions.splice(authorIndex, 1);
    }

    return filteredMentions;
}

const getUserById = async (id) => {
    try {
        const userdata = await axios.get(`https://micro.alles.cx/api/users/${id}`);
        return userdata.data;
    }
    catch (err) {
        return;
    }
}