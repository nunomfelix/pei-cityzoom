A=[]
B=[]
while True:
    try:
        data = input()
        if data == "---":
            print(data)
            A.append(B)
            B=[]
        else:
            B+=[data]
    except:
        print('finished')
    print(A)