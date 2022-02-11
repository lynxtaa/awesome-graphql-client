export async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
	const chunks: Buffer[] = []

	for await (const chunk of stream) {
		chunks.push(Buffer.from(chunk))
	}

	return Buffer.concat(chunks).toString('utf8')
}
