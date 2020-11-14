const sendNotification = require("../../utils/sendNotification");
const auth = require("../../utils/auth");
const getParentAuthors = require("../../utils/getParentAuthors");
const getMentionedUsers = require("../../utils/getMentionedUsers");
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
        const mentionedPeople = await getMentionedUsers(authors.post.content, authors.post.author.id); // Mentioned people

        for (var i = 0; i < mentionedPeople.length; i++) { // Remove mentioned people from authors (so they don't get a notification twice - they only get one for mentions then)
            const idIndex = authors.authors.indexOf(mentionedPeople[i]);
            if (idIndex > -1) {
                authors.authors.splice(idIndex, 1);
            }
        }

        await sendNotification(`${authors.post.author.nickname ?? authors.post.author.name} mentioned you`, `${authors.post.content}`, {type: "post", id: authors.post.id}, mentionedPeople, "mention");
        await sendNotification(`${authors.post.author.nickname ?? authors.post.author.name} replied to you`, `${authors.post.content}`, {type: "post", id: authors.post.id}, authors.authors, "reply");
        return res.status(200).json(authors.post);
    }).catch((err) => {
        if (err.response) {
            return res.status(err.response.status).json(err.response.data);
        }
        else {
            console.log(err);
            return res.status(500).json({ err: "internalError" });
        }
    })
}