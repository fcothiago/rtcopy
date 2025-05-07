export function base64_to_Uint8array(chunks_b64_array)
{
	        const full_chunk = chunks_b64_array.join("");
	        const bytes = new Uint8Array(full_chunk.length);
	        for(let i = 0; i < full_chunk.length; i++)
		        {
				                bytes[i] = full_chunk.charCodeAt(i);
				        }
	        return bytes;
}
