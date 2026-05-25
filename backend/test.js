

async function runTest() {
    const res = await fetch('http://localhost:3000/bfhl', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "data": ["M", "1", "334", "4", "B", "Z", "a", "7"],
            "file_b64": "JVBERi0xLjMKJcfsj6IKNSAwIG9iago8PC9MZW5ndGggNiAwIFIvRmlsdGVyIC9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nE1Oyw6CMBDzFf7DHjZlYcsN4kGJRyO3Q09KTYyJUfHvrcuCA5RknRnPZIKqFfI0Y7tG1Tqh62oYmZ7nK1W3vG6a"
        })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

runTest();
