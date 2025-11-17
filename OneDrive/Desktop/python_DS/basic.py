from enum import Enum

class State(Enum):
    INACTIVE = 0
    ACTIVE = 1

print(State.ACTIVE.value)   



name = "Sugandha Choudhary"
print(type(name))
print(isinstance(name , int))
age = str(20)
print(type(age))

print(name.lower())
print(name.upper())
print(name.startswith("Sug"))
print("an" in name)
print(name[3:11])


num = complex(2,3)
print(num.real , num.imag)

print(abs(-5.5))
new_var = 1
print(round(5.56,new_var))

##list
dogs = ["Roger" , "Syd" , 1 , "Quincy" , 7]

dogs[2]="Beau"
print(dogs)
print(dogs[2:5])
print(dogs[:-1])
dogs.append(4)
print(dogs)
dogs.extend(["Ferrero" , 4 , "YOLO"])
doggy = dogs[:]
dogs.remove(4)
dogs.pop()
dogs.insert(2,"YOLO")
print(dogs)
print(doggy)

# tuples

namess = ("Roger" , "Syd" , "Beau")

namess[-1]
namess.index("Roger")

len(namess)

print(namess)

print("Roger" in namess)

print(sorted(namess))
newTuple = namess + ("Sugandha" , "Vandana")
print(newTuple)

#dictionaries

dogs = {"names" : "Shero" , 
        "age" : 7,
        "colour" : "golden",}

dogs["names"] = "Syd"
print(dogs)

print(dogs.get("height" , 3.4))

print(dogs.pop("names"))
print(dogs.popitem())

print(list(dogs.items()))
dogs["favourite food"] = "Meat"
print(dogs)

newlist = dogs.copy()
print(newlist)

#sets
set1 = {"Sugandha" , "Choudhary"}
set2 = {"Rahul" , "Choudhary" , "Sugandha"}
intersect = set1 & set2
print(intersect)
union = set1 | set2
print(union)
print(set1-set2)
print(set1<set2)

#function

def hello(name = "my friend"):
    print("Hello "+name)

greeting = hello("Gaurish Bhatia")

