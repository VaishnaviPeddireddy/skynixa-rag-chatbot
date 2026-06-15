import preprossessing
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
# import pickle

X = preprossessing.X
Y = preprossessing.Y
sc = StandardScaler()
x_train, x_test, y_train, y_test = train_test_split(X, Y, test_size= 0.3, random_state=0)
x_train = sc.fit_transform(x_train)
x_test = sc.transform(x_test)

knn = KNeighborsClassifier(n_neighbors=7)
knn.fit(x_train, y_train)
y_pred = knn.predict(x_test)

acc = accuracy_score(y_test, y_pred)
acc = acc*100
print(f"Accuracy : ", acc)

# filename = 'KNN.sav'
# pickle.dump(knn, open(filename, 'wb'))