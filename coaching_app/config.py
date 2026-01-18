# Configuration for the coaching app
class Config:

    def __init__(self):
        
        self.sites = {
            'navigation_sites': [{
                'name': 'Mainpage',
                'url': 'mainpage',
                'view': 'coaching_app.views.mainpage'
            }, {
                'name': 'Drills',
                'url': 'drills',
                'view': 'coaching_app.views.drills'
            }, {
                'name': 'Training',
                'url': 'training_overview',
                'view': 'coaching_app.views.training_overview'
            }, {
                'name': 'Trainings Report',
                'url': 'training_report',
                'view': 'coaching_app.views.training_report'
            }, {
                'name': 'Kader',
                'url': 'roster',
                'view': 'coaching_app.views.roster'
            }, {
                'name': 'Tabelle',
                'url': 'standings',
                'view': 'coaching_app.views.standings'
            }],
        }

        self.model_choices = {
            'skill_levels': {
                1: [(1, "Basics"), (2, "Technik"), (3, "Taktik"), (4, "Weitere")],
                2: [(1, "Offense"), (2, "Defense"), (3, "Transition"), (4, "Fitness"), (5, "Weitere")]
            },
            'drill_scales': {
                'intensity': [
                    (1, "nicht intensiv"),
                    (2, "weniger intensiv"),
                    (3, "intensiv"),
                    (4, "sehr intensiv"),
                    (5, "extrem intensiv")
                ],
                'difficulty': [
                    (1, "sehr einfach"),
                    (2, "eher einfach"),
                    (3, "schwierig"),
                    (4, "sehr schwierig"),
                    (5, "extrem schwierig")
                ]
            }
        }

        self.colors = {
            "skills": {
                "soft": {
                    1: "#A7D8F5",  # Pastellblau
                    2: "#FFD1C1",  # Pastellrot
                    3: "#E6C7F7",  # Pastelllila
                    4: "#FFF7B2",  # Pastellgelb
                    5: "#6B6B6B"   # Pastellgrau
                },
                "strong": {
                    1: "#108BDD",  
                    2: "#FC4C24",
                    3: "#E86BF8",
                    4: "#F5D311",
                    5: "#6B6B6B"
                }
            },
            "finished_training": {
                True: "#808080",
                False: "#f68238"
            }
        }