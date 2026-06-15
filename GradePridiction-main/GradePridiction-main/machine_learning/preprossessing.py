import pandas as pd
import numpy as np
import os
# import pickle

cwd = os.getcwd()
path = os.path.join(cwd, 'data\\student-mat.csv')
data = pd.read_csv(path)

conditions3 = [
    (data['G3'] <= 20) & (data['G3'] >= 16),  # Excellent     A
    (data['G3'] <= 15) & (data['G3'] >= 14),  # Good          B
    (data['G3'] <= 13) & (data['G3'] >= 12),  # satisfactory  C
    (data['G3'] <= 11) & (data['G3'] >= 10),  # sufficient    D
    (data['G3'] <= 9) & (data['G3'] >= 0),  # fail          F
]

conditions1 = [
    (data['G1'] <= 20) & (data['G1'] >= 16),  # Excellent     A
    (data['G1'] <= 15) & (data['G1'] >= 14),  # Good          B
    (data['G1'] <= 13) & (data['G1'] >= 12),  # satisfactory  C
    (data['G1'] <= 11) & (data['G1'] >= 10),  # sufficient    D
    (data['G1'] <= 9) & (data['G1'] >= 0),  # fail          F
]

conditions2 = [
    (data['G2'] <= 20) & (data['G2'] >= 16),  # Excellent     A
    (data['G2'] <= 15) & (data['G2'] >= 14),  # Good          B
    (data['G2'] <= 13) & (data['G2'] >= 12),  # satisfactory  C
    (data['G2'] <= 11) & (data['G2'] >= 10),  # sufficient    D
    (data['G2'] <= 9) & (data['G2'] >= 0),  # fail          F
]

choices = ['A', 'B', 'C', 'D', 'F']

data['Classes'] = np.select(conditions3, choices, default='F')
data['G1'] = np.select(conditions1, choices, default='F')
data['G2'] = np.select(conditions2, choices, default='F')

from sklearn.preprocessing import OrdinalEncoder

categorical_cols = ['school', 'sex', 'address', 'famsize', 'Pstatus', 'Medu', 'Fedu', 'Mjob', 'Fjob', 'reason',
                    'guardian', 'traveltime', 'studytime', 'schoolsup', 'famsup', 'paid', 'activities', 'nursery',
                    'higher', 'internet', 'romantic', 'famrel', 'freetime', 'goout', 'Dalc', 'Walc', 'health', 'G1',
                    'G2', 'Classes']
encoder = OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-999)
# print(data['Pstatus'])
x = encoder.fit_transform(data[categorical_cols])
data_encoded = pd.DataFrame(x, index=data.index)
data_encoded.columns = categorical_cols
data_other_cols = data.drop(columns=categorical_cols)
data_out = pd.concat([data_other_cols, data_encoded], axis=1)
data_out.drop('G3', axis=1, inplace=True)
# print(data_out.head())

X = data_out.iloc[:, :-1]
Y = data_out.iloc[:, -1]

# filename = 'encoder.sav'
# pickle.dump(encoder, open(filename, 'wb'))