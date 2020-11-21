const axios = require("axios").default;

module.exports = async (postId) => {
    var hightestParent = postId;
    var newPost = null;
    const authors = [];

    while (hightestParent !== null) {
        try {
            const parentResponse = await axios.get(`https://micro.alles.cx/api/posts/${hightestParent}`);
            if (hightestParent === postId) {
                newPost = parentResponse.data
            }
            else {
                authors.push(parentResponse.data.author.id);
            }
            hightestParent = parentResponse.data.parent;
        }
        catch(err) {
            if (err.response) {
                // Request made and server responded
                if (err.response.data.err === "missingResource") {
                    hightestParent = null;
                }
                else {
                    throw err;
                }
              } else {
                throw err;
              }
        }
    }

    const filteredAuthors = [... new Set(authors)];
    const authorIndex = filteredAuthors.indexOf(newPost.author.id);
    if (authorIndex > -1) {
        filteredAuthors.splice(authorIndex, 1);
    }

    return { authors: filteredAuthors, post: newPost };
}