import axios from "axios";
import { getMentions } from "./getMentions";
import db from "../db";
import { getSubscribedUsers } from "./getSubscribedUsers";

export const getPostInformation = async (id): Promise<PostInformation> => {
	var highestParentId = id;
	var requestedPost = null; // Requested post information
	var authors: String[] = []; // Authors of parents
	var parents: any[] = []; // Parents of requested post
	var directMentionedUsers: String[] = []; // People mentioned in requested post
	var parentMentionedUsers: String[] = []; // People mentioned in earlier posts (parents)

	while (highestParentId !== null) {
		try {
			const _currentResponse = await axios.get(
				`${process.env.MICRO_API}/posts/${highestParentId}`
			);
			if (highestParentId === id) {
				requestedPost = _currentResponse.data;
				directMentionedUsers = directMentionedUsers.concat(
					await getMentions(_currentResponse.data)
				);
			} else {
				parents.push(_currentResponse.data);
				authors.push(_currentResponse.data.author.id);
				parentMentionedUsers = parentMentionedUsers.concat(
					await getMentions(_currentResponse.data)
				);
			}
			highestParentId = _currentResponse.data.parent;
		} catch (err) {
			if (err.response) {
				// Request made and server responded
				if (err.response.data.err === "missingResource") {
					highestParentId = null;
				} else {
					throw err;
				}
			} else {
				throw err;
			}
		}
	}

	authors = [...new Set(authors)];
	directMentionedUsers = [...new Set(directMentionedUsers)];
	parentMentionedUsers = [...new Set(parentMentionedUsers)];

	var subscribedUsers =
		requestedPost.parent !== undefined &&
		requestedPost.parent !== "" &&
		requestedPost.parent !== null
			? []
			: await getSubscribedUsers(requestedPost.author.id);

	authors = removeValueFromArray(authors, requestedPost.author.id);
	directMentionedUsers = removeValueFromArray(
		directMentionedUsers,
		requestedPost.author.id
	);
	parentMentionedUsers = removeValueFromArray(
		parentMentionedUsers,
		requestedPost.author.id
	);

	for (var author of authors) {
		directMentionedUsers = removeValueFromArray(directMentionedUsers, author);
		parentMentionedUsers = removeValueFromArray(parentMentionedUsers, author);
		subscribedUsers = removeValueFromArray(subscribedUsers, author);
	}

	for (var mention of directMentionedUsers) {
		parentMentionedUsers = removeValueFromArray(parentMentionedUsers, mention);
		subscribedUsers = removeValueFromArray(subscribedUsers, mention);
	}

	for (var mention of parentMentionedUsers) {
		subscribedUsers = removeValueFromArray(subscribedUsers, mention);
	}

	return {
		post: requestedPost,
		authors: authors,
		parents: parents,
		directMentionedUsers: directMentionedUsers,
		parentMentionedUsers: parentMentionedUsers,
		subscribedUsers: subscribedUsers,
	};
};

function removeValueFromArray(array: String[], value: String): String[] {
	const index = array.indexOf(value);
	if (index > -1) {
		array.splice(index, 1);
	}
	return array;
}

interface PostInformation {
	post: any;
	authors: String[];
	parents: any[];
	directMentionedUsers: String[];
	parentMentionedUsers: String[];
	subscribedUsers: String[];
}
