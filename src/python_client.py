import sys
import socket


def recv_line(sock):
    """Receive a single line ending with '\n', ignoring '\r'. Returns bytes or None on error."""
    chunks = []
    try:
        while True:
            b = sock.recv(1)
            if not b:
                return None
            if b == b'\n':
                break
            if b != b'\r':
                chunks.append(b)
        return b"".join(chunks)
    except Exception:
        return None


def main():
    # Expect: python_client.py <ip> <port>
    if len(sys.argv) != 3:
        return 1

    server_ip = sys.argv[1]

    try:
        port = int(sys.argv[2])
    except ValueError:
        return 1

    if port < 1 or port > 65535:
        return 1

    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect((server_ip, port))
    except Exception:
        return 1

    try:
        while True:
            line = sys.stdin.readline()
            if not line:
                break  # EOF

            line = line.rstrip("\n")

            if line == "exit" or line == "quit":
                break

            # Send command with required '\n'
            data = (line + "\n").encode("utf-8")
            try:
                sock.sendall(data)
            except Exception:
                break

            # 1. Status line
            status = recv_line(sock)
            if status is None:
                break

            status_text = status.decode("utf-8")
            print(status_text)

            if not status_text.startswith("200 "):
                continue

            # 2. blank line
            blank = recv_line(sock)
            if blank is None:
                break

            # 3. body line
            body = recv_line(sock)
            if body is None:
                break

            print(body.decode("utf-8"), flush=True)

    finally:
        sock.close()

    return 0


if __name__ == "__main__":
    sys.exit(main())
