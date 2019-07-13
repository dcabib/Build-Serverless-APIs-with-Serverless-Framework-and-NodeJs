const uuid = require('uuid');
const Joi = require('joi');
const dynamoDB = require('../dynamodb');

module.exports.handler = async (evt, ctx) => {
	const data = JSON.parse(evt.body);
	const timestamp = new Date().getTime();
	const id = evt.pathParameters.id;

	const schema = Joi.object().keys({
		title: Joi.string().required(),
		published: Joi.boolean().required()
	});

	const { error, value } = Joi.validate(data, schema);
	if (error) {
		return {
			statusCode: 400,
			body: JSON.stringify(error.details)
		};
	}

	const params = {
		TableName: process.env.JOBS_TABLE,
		Key: {
			id
		},
		UpdateExpression:
			'SET title = :title, published = :published, updatedAt = :updatedAt',
		ExpressionAttributeValues: {
			':title': data.title,
			':published': data.published,
			':updatedAt': timestamp
		},
		ReturnValues: 'ALL_NEW'
	};
	try {
		const results = await dynamoDB.update(params).promise();
		return {
			statusCode: 200,
			body: JSON.stringify(results.Attributes)
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify(error)
		};
	}
};
