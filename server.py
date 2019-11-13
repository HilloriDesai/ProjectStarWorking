from flask import Flask, render_template, Response
from circle_detection_test import get_frame
import circle_detection_test
import json, threading

t1 = threading.Thread(target=circle_detection_test.run_server)
t1.start()
t2 = threading.Thread(target=circle_detection_test.main_code)
t2.start()

app = Flask(__name__)
	
@app.route('/')
def index():
	return render_template('index.html')

def gen(capture):
	while True:
		print("getting frame")
		frame = circle_detection_test.get_frame(capture)
		yield (b'--frame\r\n'
			   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')


# def gen(camera):
# 	while True:
# 		print("getting frame")
# 		frame = camera.get_frame()
# 		yield (b'--frame\r\n'
# 			   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@app.route('/video_feed')
def video_feed():
	print(circle_detection_test.capture)
	return Response(gen(circle_detection_test.capture),
					mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
	app.run(use_reloader=False)
	app.run(host='127.0.0.1', port="5000", debug=True)
