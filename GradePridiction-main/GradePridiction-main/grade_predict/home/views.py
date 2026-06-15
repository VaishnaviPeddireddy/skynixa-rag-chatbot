from django.shortcuts import render
from django.http import HttpResponse
import pandas as pd
from sklearn.preprocessing import OrdinalEncoder
import pickle


# Create your views here.


def index(request):
    return render(request, 'index.html')


def grade_predict(request):
    return render(request, 'grade_prediction.html')


def grade_backend(request):
    # print(request.POST)
    algo = request.POST["algo"]

    dict1 = request.POST.dict()
    del dict1['algo']
    del dict1['csrfmiddlewaretoken']
    print(dict1)

    dict1['Medu'] = int(dict1['Medu'])
    dict1['Fedu'] = int(dict1['Fedu'])
    dict1['traveltime'] = int(dict1['traveltime'])
    dict1['studytime'] = int(dict1['studytime'])
    dict1['failures'] = int(dict1['failures'])
    dict1['famrel'] = int(dict1['famrel'])
    dict1['freetime'] = int(dict1['freetime'])
    dict1['goout'] = int(dict1['goout'])
    dict1['Dalc'] = int(dict1['Dalc'])
    dict1['Walc'] = int(dict1['Walc'])
    dict1['health'] = int(dict1['health'])

    data = pd.DataFrame(dict1, index=[0])
    data['Classes'] = 'A'
    print(data['Pstatus'])
    categorical_cols = ['school', 'sex', 'address', 'famsize', 'Pstatus', 'Medu', 'Fedu', 'Mjob', 'Fjob', 'reason',
                        'guardian', 'traveltime', 'studytime', 'schoolsup', 'famsup', 'paid', 'activities', 'nursery',
                        'higher', 'internet', 'romantic', 'famrel', 'freetime', 'goout', 'Dalc', 'Walc', 'health', 'G1',
                        'G2', 'Classes']

    loaded_model = pickle.load(open('encoder.sav', 'rb'))
    x = loaded_model.transform(data[categorical_cols])
    data_encoded = pd.DataFrame(x, index=data.index)
    data_encoded.columns = categorical_cols
    data_other_cols = data.drop(columns=categorical_cols)
    data_out = pd.concat([data_other_cols, data_encoded], axis=1)
    data_out.drop('Classes', axis=1, inplace=True)

    if algo.find('_') != -1:
        data_out.drop('higher', axis=1, inplace=True)
    clf = pickle.load(open(algo + ".sav", 'rb'))
    result = clf.predict(data_out)
    if result == 0:
        result = 'A'
    elif result == 1:
        result = 'B'
    elif result == 2:
        result = 'C'
    elif result == 3:
        result = 'D'
    elif result == 4:
        result = 'F'
    return HttpResponse(result)


def graph(request):
    return render(request, 'graph.html')
