from __future__ import print_function
import sys
from operator import add
from pyspark import SparkContext
from subprocess import Popen, PIPE
import math
import time
import itertools 
from itertools import product

def rad(d):
    return d*math.pi/180.0

def distance(lat1,lng1,lat2,lng2):
    radlat1=rad(lat1)
    radlat2=rad(lat2)
    a=radlat1-radlat2
    b=rad(lng1)-rad(lng2)
    s=2*math.asin(math.sqrt(math.pow(math.sin(a/2),2)+math.cos(radlat1)*math.cos(radlat2)*math.pow(math.sin(b/2),2)))
    earth_radius=6378.137
    s=s*earth_radius
    if s<0:
        return -s
    else:
        return s

def time_minus(t1_str, t2_str):
	t1 = time.strptime(t1_str, "%Y-%m-%d %H:%M:%S")
	t2 = time.strptime(t2_str, "%Y-%m-%d %H:%M:%S")
	t = time.mktime(t1) - time.mktime(t2)
	
	if t<0:
		t = -t

	return t

def time_minus1(list_time):
	time_min = min(list_time)
	time_max = max(list_time)
	
	t1 = time.strptime(time_min, "%Y-%m-%d %H:%M:%S")
	t2 = time.strptime(time_max, "%Y-%m-%d %H:%M:%S")
	t = time.mktime(t2) - time.mktime(t1)
	
	if t<0:
		t = -t

	return t
	

# directly execute py
if __name__ == "__main__":
	
	tStart = time.time()	
	time_limit = float(sys.argv[1])
	R = float(sys.argv[2])

	#print (R)

	if len(sys.argv) != 3:
		print("Usage: wordcount <file>", file=sys.stderr)
		exit(-1)
	
	

	sc = SparkContext(appName="Test")
	#sc = SparkContext()
	lines = sc.textFile("TaipeiBurglary2015_01_10.csv")

	lines = lines.map(lambda line: line.split(","))

	lines = lines.map(lambda a: (a[0].encode(), [a[1].encode(), a[2].encode(), a[3].encode(), a[4].encode()]))
	lines = lines.filter(lambda a: True if a[0]!='ID' else False)

	one_table_list = lines.collect() #(id, [type, time, la, ln])
		
	line_cartesian = lines.cartesian(lines)
	line_cartesian = line_cartesian.map(lambda x : (x[0][0], x[1][0], time_minus(x[0][1][1], x[1][1][1]), distance(float(x[0][1][2]), float(x[0][1][3]), float(x[1][1][2]), float(x[1][1][3]))))
	line_cartesian = line_cartesian.filter(lambda x: True if (x[2] < time_limit) and (x[3] < math.pow(R,1/3)) and (x[0] < x[1]) else False)

	two_table = line_cartesian.map(lambda x: (x[0],x[1])) #check two point in R in T
	two_table_list = two_table.collect()
	pattern_id_list = []
	pattern_id_list.append(two_table)
	two_table = line_cartesian.map(lambda x: ((x[0],),x[1]))
	
	tOne = time.time()
	print(tOne-tStart)

	def idAndTime(x):
		t = (x[1][0],)
		t = x[0]+t
	
		time_list = []
		for y in t:
			time_list.append(one_table_list[int(y)-1][1][1])

		time_list.append(one_table_list[int(x[1][1])-1][1][1])
		return (t, x[1][1], time_list)

	def typeSortByTime(id_list):
		time_dic = {}
		for x in id_list:
			if one_table_list[int(x)-1][1][1] in time_dic:
				time_dic[one_table_list[int(x)-1][1][1]].append(x)
			else:
				time_dic[one_table_list[int(x)-1][1][1]] = [x]

		sort_list = sorted(time_dic)
		
		id_list = []		
		for x in sort_list:
			id_list.append(list(itertools.permutations(time_dic[x])))

		result = []
		for element in itertools.product(*id_list):			
			r = ()
			for x in element:
				r = r + x
			result.append(r)

		#print (result)
		
		result1 = []
		for l in result: #[(1,2,5),(2,7,5),(3,50,8)]
			tu = ()			
			for t in l:
				tu = tu + (one_table_list[int(t)-1][1][0],)
			result1.append((tu,1))
		
		return result1
	
	
	three_table = two_table.join(two_table)
	three_table = three_table.filter(lambda x: True if (x[1][0] < x[1][1] and x[1] in two_table_list) else False) #filter(3,3),(3,2)
	#print (two_table.collect())

	tTwo = time.time()
	print(tTwo-tOne)	
	while(three_table.collect() != []):
		three_table = three_table.map(idAndTime)
		three_table = three_table.filter(lambda x: True if time_minus1(x[2]) < time_limit else False)
		two_table = three_table.map(lambda x: (x[0], x[1]))
		pattern_id_list.append(two_table.map(lambda x: x[0]+(x[1],)))
		three_table = two_table.join(two_table)
		three_table = three_table.filter(lambda x: True if (x[1][0] < x[1][1] and x[1] in two_table_list) else False) #filter(3,3),(3,2)
		#three_table = three_table.filter(lambda x: True if x[1] in two_table_list else False) #filter not in two table
	
	#for y in pattern_id_list:
	#	print (y.flatMap(typeSortByTime).reduceByKey(add).collect())
	
	tThr = time.time()
	print(tThr-tTwo)
	
	
	csv = open('result.csv', 'w')
	for each in pattern_id_list:
		#print(each.count(), file=csv)
		print("", file=csv)
		for tuple1 in each.collect():
			for i in range(len(tuple1)):
				if i == len(tuple1)-1:
					print(tuple1[i], file=csv)
				else:
					print(tuple1[i]+',', file=csv, end='')
	
	csv.close()
	
	'''
	print("=============")
	for each in pattern_id_list:
		print(each.count())
		for tuple1 in each.collect():
			print(tuple1)
	'''
	tEnd = time.time()
	print(tEnd-tThr)			
	print(tEnd-tStart)
