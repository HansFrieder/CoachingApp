from django.core.paginator import Paginator
from django.core import serializers
from datetime import datetime, timedelta
import json

from .models import *

# TECHNICAL HELPERS
def measure_context_size(context:dict) -> int:
    '''
    Measure the size of a context dictionary in bytes.
    '''

    size = len(json.dumps(context).encode('utf-8'))
    size_in_kb = size / 1024
    print(f"Context size: {size} bytes ({size_in_kb:.2f} KB)")

    return size_in_kb

# DRILL HANDLERS

def create_drill(new_drill:dict) -> None:
    """
    Create a new drill instance.

    Args:
        new_drill (dict): A dictionary containing the drill's details, including:
            - name (str): The name of the drill.
            - description (str): A description of the drill.
            - skills (list): A list of skill IDs associated with the drill.
            - intensity (int): The intensity level of the drill.
            - difficulty (int): The difficulty level of the drill.
    Returns:
        None
    """

    # Drill-Objekt erstellen
    drill = Drill.objects.create(
        name=new_drill['name'],
        description=new_drill['description'],
        intensity=new_drill['intensity'],
        difficulty=new_drill['difficulty']
    )

    # Setze die ManyToMany-Beziehung (nach dem Erstellen)
    if new_drill['skills']:
        drill.skills.set(new_drill['skills'])  # erwartet Liste von IDs

    # Speichere das Drill-Objekt
    drill.save()

    return None

def update_drill(updated_drill:dict) -> None:
    """
    Update an existing drill instance.

    Args:
        updated_drill (dict): A dictionary containing the updated details of the drill.
            - drill_id (int): The ID of the drill to update.
            - name (str): The new name of the drill.
            - description (str): The new description of the drill.
            - skills (list): A list of skill IDs to associate with the drill.
            - intensity (int): The new intensity level of the drill.
            - difficulty (int): The new difficulty level of the drill.
    Returns:
        None
    """

    drill_id = updated_drill['drill_id']
    
    # Hole das Drill-Objekt
    drill = Drill.objects.get(id=drill_id)

    drill.name = updated_drill['name']
    drill.description = updated_drill['description']
    drill.intensity = updated_drill['intensity']
    drill.difficulty = updated_drill['difficulty']

    # Update ManyToMany relationship
    if 'skills' in updated_drill:
        skills_ids = updated_drill['skills']
        drill.skills.set(skills_ids)
    
    # Speichere das aktualisierte Drill-Objekt
    drill.save()

    return None

# def create_drill_description_html(drill:Drill) -> str:
#     '''
#     Create the HTML description for a drill.
#     '''

#     # Stats berechnen und neu laden, wenn nicht vorhanden
#     if not drill.stats:
#         drill.save()
#         drill = Drill.objects.get(id=drill.id)

#     html = "<br>"
    
#     # Bechreibung
#     html += f"<strong>Beschreibung:</strong><br><div>{drill.description}</div><br>"

#     # Trainierte Skills
#     html += "<strong>Dieser Drill trainiert...</strong><br>"
#     for idx, count in enumerate(drill.stats['level2_distr']):
#         if count > 0:
#             percentage = count / sum(drill.stats['level2_distr']) * 100 if sum(drill.stats['level2_distr']) > 0 else 0
#             skill_names = ', '.join([skill.name for skill in drill.skills.filter(level2=idx + 1)])
#             html += f'''
#                 <span style="display: inline-block; width: 12px; height: 12px; background-color: {config.colors["skills"]["strong"][idx + 1]}; margin-right: 5px;"></span>
#                 {percentage:.0f}% {config.model_choices["skill_levels"][2][idx][1]} - <i>{skill_names}</i><br>
#             '''
    
#     # Auslastung
#     html += "<br><strong>Auslastung:</strong><br>"
#     html += f"""
#         <div>Der Drill ist körperlich <i>{config.model_choices['drill_scales']['intensity'][drill.intensity - 1][1]}</i> 
#         und technisch <i>{config.model_choices['drill_scales']['difficulty'][drill.difficulty - 1][1]}</i>.</div>
#     """

#     return html

# def create_drill_list(filter_dict:dict) -> dict:
#     '''
#     Create a filtered and paginated drill lists with all information to render "pages/drill_list.html":
#     '''

#     # Daten abrufen
#     drills = Drill.objects.all()
#     drills = drills.order_by('name')  # Sortieren nach Name
#     skills = Skill.objects.all()
#     stats = {drill.id: drill.stats for drill in drills}

#     # Filter anwenden
#     if filter_dict['search']:
#         drills = drills.filter(name__icontains=filter_dict['search'])
#     if filter_dict['skills']:
#         drills = drills.filter(skills__pk__in=filter_dict['skills'])

#     # Drills Paginattion
#     paginator = Paginator(drills, 5)  # 5 drills per page
#     drills_page = paginator.get_page(filter_dict['page'])
#     for drill in drills_page:
        
#         # HTML Beschreibung erstellen und in Json Feld speichern
#         html = create_drill_description_html(drill)
#         drill.description = html

#     # Daten als Json übergeben
#     drills_json = serializers.serialize("json", drills_page)
#     skills_json = serializers.serialize("json", skills)
#     stats_json = json.dumps(stats)
    
#     return {
#         # 'drills': drills_page,
#         'drills': drills_json,
#         # 'skills': skills,
#         'skills': skills_json,
#         'stats': stats_json
#     }

def create_drill_list(filter_dict:dict, paginate:int=10) -> dict:
    '''
    Creates the drill list for API Response.
    '''

    # Daten abrufen
    drills = Drill.objects.all()
    drills = drills.order_by('name')  # Sortieren nach Name
    skills = Skill.objects.all()

    # Filter anwenden
    if filter_dict['search']:
        drills = drills.filter(name__icontains=filter_dict['search'])
    if filter_dict['level1']:
        drills = drills.filter(stats__level1_main=filter_dict['level1'])
    if filter_dict['level2']:
        drills = drills.filter(stats__level1_main=filter_dict['level2'])
    if filter_dict['skills']:
        drills = drills.filter(skills__pk__in=filter_dict['skills'])

    # Drills Paginattion
    paginator = Paginator(drills, paginate)  # 5 drills per page
    drills_page = paginator.get_page(filter_dict['page'])

    drill_list =  {
        'meta': config.model_choices,
        'drills': [
            {
                "id": drill.id,
                "name": drill.name,
                
                "level1_main": drill.stats.get("level1_main", 0),
                "level1_distr": drill.stats.get("level1_distr", []),
                "level2_main": drill.stats.get("level2_main", 0),
                "level2_distr": drill.stats.get("level2_distr", []),
                
                "intensity": drill.stats.get("intensity", 0),
                "difficulty": drill.stats.get("difficulty", 0),
            } for drill in drills_page
        ],
        'skills': [
            {
                "id": skill.id,
                "name": skill.name,
            } for skill in skills
        ],
        "paginator": {
            "page": drills_page.number,
            "num_pages": paginator.num_pages,
        }
    }

    return drill_list

# TRAINING HANDLERS

def create_training(new_training:dict) -> None:
    """
    Create a new training instance.

    Args:
        new_training (dict): A dictionary containing the training's details, including:
            - date (str): The date of the training session.
            - player_count (int): The number of players attending.
            - duration (str): The duration of the training session.
            - actions (list): A list of action dictionaries associated with the training.
            - notes (str): Additional notes for the training session.
    Returns:
        None
    """
    
    # Actions transformieren
    actions = []
    for action in new_training['actions']:
        actions.append({
            'drill': action['id'],
            'duration': action.get('duration', 10),
            'description': action.get('name') if 'custom' in action['id'] else None
        })

    # Training-Objekt erstellen
    training = Training.objects.create(
        date=datetime.strptime(new_training['date'], "%Y-%m-%d").date(),
        player_count=new_training['player_count'],
        duration=timedelta(minutes=sum([int(x) for x in new_training['duration']])),
        actions=actions,
        description=new_training['notes']
    )

    # Speichere das Training-Objekt
    training.save()

    return None

def update_training(updated_training:dict) -> None:
    """
    Update an existing training instance.

    Args:
        updated_training (dict): A dictionary containing the updated details of the training.
            - training_id (int): The ID of the training to update.
            - date (str): The new date of the training session.
            - player_count (int): The new number of players attending.
            - duration (str): The new duration of the training session.
            - actions (list): A list of action dictionaries associated with the training.
            - notes (str): Additional notes for the training session.
    Returns:
        None
    """

    training_id = updated_training['training_id']
    
    # Hole das Training-Objekt
    training = Training.objects.get(id=training_id)

    # Actions transformieren
    actions = []
    for action in updated_training['actions']:
        actions.append({
            'drill': action['id'],
            'duration': action.get('duration', 10),
            'description': action.get('name') if 'custom' in action['id'] else None
        })

    training.date = datetime.strptime(updated_training['date'], "%Y-%m-%d").date()
    training.player_count = updated_training['player_count']
    training.duration = timedelta(minutes=sum([int(x) for x in updated_training['duration']]))
    training.actions = actions
    training.description = updated_training['notes']
    
    # Speichere das aktualisierte Training-Objekt
    training.save()

    return None

def create_training_description_html(training:Training) -> str:
    '''
    Create the HTML description for a training.
    '''

    # Stats berechnen und neu laden, wenn nicht vorhanden
    if not training.stats:
        training.save()
        training = Training.objects.get(id=training.id)

    html = "<br>"
    
    # Actions
    html += "<strong>Inhalte der Trainingseinheit:</strong><br><ol style='list-style: hiragana;'>"
    for action in training.actions:
        if 'custom' in action['drill']:
            html += f"<li><i>Custom: {action.get('description', '?')} ({action.get('duration', 10)} Min.)</i></li>"
        else:
            drill = Drill.objects.get(id=action['drill'])
            html += f"<li>{drill.name} ({action.get('duration', 10)} Min.)</li>"
    html += "</ol>"

    # Notizen
    html += f"<strong>Notizen:</strong><br><div>{training.description}</div><br>"

    # Wenn Training abgeschlossen
    if training.checked:
        html += f"<div><strong>Spieleranzahl:</strong> {training.player_count}</div>"
        html += f"<div><strong>Dauer:</strong> {int(training.duration.total_seconds() / 60)} Minuten</div><br>"
        html += "<div style='color: green; font-weight: bold;'>✔ Training abgeschlossen</div>"
    else:
        html += "<div style='color: orange; font-weight: bold;'>&#9680 Training noch nicht abgeschlossen</div>"

    return html

def create_training_list(filter_dict:dict) -> dict:
    '''
    Create a list of trainings with all information to render "pages/training_overview.html":
    '''

    # Daten abrufen
    trainings = Training.objects.all()
    stats = {training.id: training.stats for training in trainings}
    
    # Filter anwenden
    if filter_dict['search']:
        trainings = trainings.filter(name__icontains=filter_dict['search'])
    
    # sortieren und serialisieren
    trainings = trainings.order_by('checked', '-date')  # Sortieren nach Datum absteigend

    # for training in trainings:
        
    #     # HTML Beschreibung erstellen und in Json Feld speichern
    #     # html = create_training_description_html(training)
    #     # print(html)
    #     # training.description = html
    
    # Daten als json übergeben
    trainings_json = serializers.serialize("json", trainings)
    stats_json = json.dumps(stats)

    return {
        'trainings': trainings_json,
        'stats': stats_json
    }