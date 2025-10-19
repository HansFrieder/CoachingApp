from .models import *

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


def create_list_view(
    model:object,
    request:object,
    search:str = 'name',
    filter:list = [],
    buttons:list = ['update', 'delete'],
    on_click:str = 'popup',
    custom_canvases:int = 0,
    custom_style_props:str = None
) -> dict:
    
    """
    Function to create a context dict for rendering a list view,
    using the inclusion of "list.html" template.
    """

    model_objects = model.objects.all().order_by(search)

    filter_dict = {
        'search': request.GET.get(search, None), # Suchfeld -> required/Default: 'name'
        **{f: request.GET.get(f, None) for f in filter} # Für jeden Filter
    }

    # TODO

    return {}