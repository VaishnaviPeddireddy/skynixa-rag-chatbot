import preprossessing
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import pickle

X = preprossessing.X
Y = preprossessing.Y
sc = StandardScaler()
x_train, x_test, y_train, y_test = train_test_split(X, Y, test_size=0.3, random_state=0)
x_train = sc.fit_transform(x_train)
x_test = sc.transform(x_test)


rdecision_tree = RandomForestClassifier(n_estimators=100)
rf = rdecision_tree.fit(x_train, y_train)
y_pred = rf.predict(x_test)


acc = accuracy_score(y_test, y_pred)
acc = acc*100
print(f"Accuracy : ", acc)

filename = 'RF.sav'
pickle.dump(rf, open(filename, 'wb'))