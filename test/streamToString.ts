export async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
	const chunks: Buffer[] = []

	await new Promise<void>((resolve, reject) => {
		stream.on('data', chunk => chunks.push(Buffer.from(chunk)))
		stream.on('error', reject)
		stream.on('end', resolve)
	})

	return Buffer.concat(chunks).toString('utf8')
}
