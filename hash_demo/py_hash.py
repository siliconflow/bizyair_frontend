import hashlib
import crcmod
import base64

do_crc64 = crcmod.mkCrcFun(
    0x142F0E1EBA9EA3693, initCrc=0, xorOut=0xFFFFFFFFFFFFFFFF, rev=True
)

def calculate_hash(file_path):
    crc64_signature = 0
    md5_hash = hashlib.md5()
    buf_size = 65536 * 16
    with open(file_path, "rb") as f:
        while chunk := f.read(buf_size):
            crc64_signature = do_crc64(chunk, crc64_signature)
            md5_hash.update(chunk)
    md5_digest = md5_hash.digest()
    md5_str = base64.b64encode(md5_digest).decode("utf-8")
    hasher = hashlib.sha256()
    hasher.update(f"{md5_str}{crc64_signature}".encode("utf-8"))
    hash_string = hasher.hexdigest()
    return hash_string

r = calculate_hash("./input.txt")
print(r)
