import cv2
import numpy as np
import threading
import json
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket


server = None
clients = []
capture = None


class SimpleWSServer(WebSocket):
	def handleConnected(self):
		clients.append(self)

	def handleClose(self):
		clients.remove(self)


def run_server():
	global server
	server = SimpleWebSocketServer('', 9000, SimpleWSServer,
								   selectInterval=(1000.0 / 60) / 1000)
	print("run_server")
	server.serveforever()

# t = threading.Thread(target=run_server)
# t.start()


# capture = cv2.VideoCapture(0)

def get_frame(capture):
	print("get_frame")
	success, image = capture.read()
	ret, jpeg = cv2.imencode('.jpg', image)
	return jpeg.tobytes()

t = 100
w = 640

last = 0

def main_code():
	global capture
	capture = cv2.VideoCapture(0)
	global server
	while True:
		ret, image = capture.read()
		# print("ret ",ret)
		img_height, img_width, depth = image.shape
		scale = w / img_width
		h = img_height * scale
		image = cv2.resize(image, (0,0), fx=scale, fy=scale)

		# Apply filters
		grey = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
		blured = cv2.medianBlur(grey, 9)

		image = np.dstack([cv2.Canny(blured, t / 2, t)] * 3)

		#cv2.imshow('Image previews', image)

		sc = 1
		md = 30
		at = 40
		circles = cv2.HoughCircles(blured, cv2.HOUGH_GRADIENT, sc, md, t, at)

		if circles is not None:
			# We care only about the first circle found.
			circle = circles[0][0]
		if circle.size == 3:
				x, y, radius = int(circle[0]), int(circle[1]), int(circle[2])
				#print(float(x) / float(w), float(y) / float(h), float(radius) / float(w))

				# Highlight the circle
				#cv2.circle(image, (x, y), radius, (0, 0, 255), 1)
				# Draw dot in the center
				#cv2.circle(image, (x, y), 1, (0, 0, 255), 1)

				for client in clients:
						client.sendMessage(unicode(json.dumps({'x': float(x) / float(w), 'y': float(y) / float(h), 'radius': float(radius) / float(w)})))

		# cv2.imshow('Image with detected circle', image)

		# if cv2.waitKey(1) & 0xFF == ord('q'):
			# break


	server.close()

# t1 = threading.Thread(target=main_code)
# t1.start()
# main_code()
