import axios from "axios";

export const getMentions = async (post) => {
	const splittedContent = post.content.replace(/\n/g, " ").split(" ");

	var mentionedUserIds: String[] = [];

	for (var word of splittedContent) {
		const _filteredWord = word.replace(/[^a-zA-Z0-9-@]/g, "");
		if (_filteredWord.startsWith("@")) {
			var idToBeRequested = "";
			const _filteredMention = _filteredWord.replace(/[^a-zA-Z0-9-]/g, "");

			try {
				const _usernamedata = await axios.get(
					`${process.env.MICRO_API}/username/${_filteredMention}`
				);
				const user = await getUserById(_usernamedata.data.id);
				if (user !== undefined) {
					mentionedUserIds.push(user.id);
				} else {
					throw new Error("doesn't exist");
				}
			} catch {
				const user = await getUserById(_filteredMention);
				if (user !== undefined) mentionedUserIds.push(user.id);
			}
		}
	}

	const filteredMentions = [...new Set(mentionedUserIds)];
	const authorIndex = filteredMentions.indexOf(post.author.id);
	if (authorIndex > -1) {
		filteredMentions.splice(authorIndex, 1);
	}

	return filteredMentions;
};

const getUserById = async (id) => {
	try {
		const userdata = await axios.get(`${process.env.MICRO_API}/users/${id}`);
		return userdata.data;
	} catch (err) {
		return;
	}
};
