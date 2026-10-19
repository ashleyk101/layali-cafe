# Local preview server for the site/ folder (bigger connection queue than
# `python -m http.server`, which drops requests on Windows under load).
import functools, http.server, os

class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 128

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site")
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=root)
Server(("127.0.0.1", 5173), handler).serve_forever()
