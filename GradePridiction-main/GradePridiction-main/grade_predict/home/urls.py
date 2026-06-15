from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('grade/', views.grade_predict, name='grade'),
    path('grade-predict/', views.grade_backend, name='grade1'),
    path('graph/', views.graph, name='graph'),
]