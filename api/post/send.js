const sendNotification = require("../../utils/sendNotification");
const auth = require("../../utils/auth");
const getParentAuthors = require("../../utils/getParentAuthors");
const getMentionedUsers = require("../../utils/getMentionedUsers");
const getSubscribedUsers = require("../../utils/getSubscribedUsers");
const axios = require("axios").default;

module.exports = async (req, res) => {
    const { content, image, url, parent } = req.body;

    axios.post("https://micro.alles.cx/api/posts/", {
        content: content,
        image: image,
        url: url,
        parent: parent
    }, {
        headers: {
            Authorization: req.headers.authorization ?? ""
        }
    }).then( async (response) => {
        const authors = await getParentAuthors(response.data.id); // Authors of parents
        res.status(200).json(authors.post);
        var mentionedPeople = await getMentionedUsers(authors.post.content, authors.post.author.id); // Mentioned people
        var mentionedPeopleInParents = [];

        for (var i = 0; i < authors.parents.length; i++) {
            var mentionedusers = await getMentionedUsers(authors.parents[i].content, authors.parents[i].author.id)
            const authorIndex = mentionedusers.indexOf(authors.post.author.id);
            if (authorIndex > -1) {
                mentionedusers.splice(authorIndex, 1);
            }
            console.log(mentionedusers);
            mentionedPeopleInParents = mentionedPeopleInParents.concat(mentionedusers);
        }

        const subscribedPeople = ((parent === null || parent === undefined || parent === "") ? await getSubscribedUsers(authors.post.author.id) : []);

        for (var i = 0; i < mentionedPeople.length; i++) { // Remove mentioned people from authors (so they don't get a notification twice - they only get one for mentions then)
            const idIndexAuthors = authors.authors.indexOf(mentionedPeople[i]);
            if (idIndexAuthors > -1) {
                authors.authors.splice(idIndexAuthors, 1);
            }

            const idIndexSubscribed = subscribedPeople.indexOf(mentionedPeople[i]);
            if (idIndexSubscribed > -1) {
                subscribedPeople.splice(idIndexSubscribed, 1);
            }

            const idIndexMentionedInParents = mentionedPeopleInParents.indexOf(mentionedPeople[i]);
            console.log(mentionedPeople[i]);
            console.log(mentionedPeopleInParents);
            console.log(idIndexMentionedInParents);
            if (idIndexMentionedInParents > -1) {
                mentionedPeopleInParents.splice(idIndexMentionedInParents, 1);
            }
        }

        for (var i = 0; i < authors.authors.length; i++) {
            const idIndexSubscribed = subscribedPeople.indexOf(authors.authors[i]);
            if (idIndexSubscribed > -1) {
                subscribedPeople.splice(idIndexSubscribed, 1);
            }

            const idIndexMentionedInParents = mentionedPeopleInParents.indexOf(authors.authors[i]);
            if (idIndexMentionedInParents > -1) {
                mentionedPeopleInParents.splice(idIndexMentionedInParents, 1);
            }
        }

        await sendNotification(`${authors.post.author.nickname ?? authors.post.author.name} mentioned you`, `${authors.post.content}`, {type: "post", id: authors.post.id}, mentionedPeople, "mention");
        await sendNotification(`${authors.post.author.nickname ?? authors.post.author.name} replied to you`, `${authors.post.content}`, {type: "post", id: authors.post.id}, authors.authors, "reply");
        await sendNotification(`${authors.post.author.nickname ?? authors.post.author.name} replied to a post you're mentioned in`, `${authors.post.content}`, { type: "post", id: authors.post.id }, mentionedPeopleInParents, "reply");
        await sendNotification(`${authors.post.author.nickname ?? authors.post.author.name} just posted`, `${authors.post.content}`, {type: "post", id: authors.post.id}, subscribedPeople, "subscription");
    }).catch((err) => {
        if (err.response && err.response.data.hasOwnProperty('err')) {
            return res.status(err.response.status).json(err.response.data);
        }
        else {
            return res.status(500).json({ err: "internalError" });
        }
    })
}