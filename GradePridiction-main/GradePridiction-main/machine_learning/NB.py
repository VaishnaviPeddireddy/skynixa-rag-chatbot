import preprossessing
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.naive_bayes import GaussianNB
# import pickle

X = preprossessing.X
Y = preprossessing.Y
x_train, x_test, y_train, y_test = train_test_split(X, Y, test_size= 0.3, random_state=0)
gnb = GaussianNB()
gnb.fit(x_train, y_train)
y_pred = gnb.predict(x_test)
acc = accuracy_score(y_test, y_pred)
acc = acc*100
print(f"Accuracy : ", acc)

# filename = 'NB.sav'
# pickle.dump(gnb, open(filename, 'wb'))