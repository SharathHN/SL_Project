from flask import Blueprint, jsonify

from flask_jwt_extended import jwt_required
from elasticapm import capture_span
import pandas as pd


analysis_blueprint = Blueprint('analysis', __name__)

