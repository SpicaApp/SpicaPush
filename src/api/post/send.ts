import * as express from "express";
import axios from "axios";
import { getPostInformation } from "../../utils/getPostInformation";
import {
	sendNotification,
	NotificationType,
} from "../../utils/sendNotification";

const send = async (req: express.Request, res: express.Response) => {
	const { content, image, url, parent } = req.body;

	axios
		.post(
			`${process.env.MICRO_API}/posts`,
			{
				content: content,
				image: image,
				url: url,
				parent: parent,
			},
			{
				headers: {
					Authorization: req.headers.authorization ?? "",
				},
			}
		)
		.then(async (microResponse) => {
			const post = await getPostInformation(microResponse.data.id);
			res.status(200).json(post.post);

			await sendNotification({
				title: `${
					post.post.author.nickname ?? post.post.author.name
				} mentioned you`,
				message: `${post.post.content}`,
				payload: { type: "post", id: post.post.id, click_action: "FLUTTER_NOTIFICATION_CLICK" },
				uids: post.directMentionedUsers,
				type: NotificationType.MENTION,
			});

			await sendNotification({
				title: `${
					post.post.author.nickname ?? post.post.author.name
				} replied to you`,
				message: `${post.post.content}`,
				payload: { type: "post", id: post.post.id, click_action: "FLUTTER_NOTIFICATION_CLICK" },
				uids: post.authors,
				type: NotificationType.REPLY,
			});

			await sendNotification({
				title: `${
					post.post.author.nickname ?? post.post.author.name
				} replied to a post you're mentioned in`,
				message: `${post.post.content}`,
				payload: { type: "post", id: post.post.id, click_action: "FLUTTER_NOTIFICATION_CLICK" },
				uids: post.parentMentionedUsers,
				type: NotificationType.REPLY,
			});

			await sendNotification({
				title: `${
					post.post.author.nickname ?? post.post.author.name
				} just posted something`,
				message: `${post.post.content}`,
				payload: { type: "post", id: post.post.id, click_action: "FLUTTER_NOTIFICATION_CLICK" },
				uids: post.subscribedUsers,
				type: NotificationType.SUBSCRIPTION,
			});
		})
		.catch((err) => {
			if (err.response && err.response.data.hasOwnProperty("err")) {
				return res.status(err.response.status).json(err.response.data);
			} else {
				console.log(err);
				return res.status(500).json({ err: "internalError" });
			}
		});
};

export default send;
