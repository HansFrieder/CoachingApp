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
                'name': 'Training planen',
                'url': 'plan_training',
                'view': 'coaching_app.views.plan_training'
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
                    (1, "Leicht"),
                    (2, "Mittel"),
                    (3, "Intensiv"),
                    (4, "Sehr intensiv"),
                    (5, "Extrem intensiv")
                ],
                'difficulty': [
                    (1, "Einfach"),
                    (2, "Mittel"),
                    (3, "Schwierig"),
                    (4, "Sehr schwierig"),
                    (5, "Extrem schwierig")
                ]
            }
        }

        self.colors = {
            "skills": {
                1: "#108BDD",  # Blue
                2: "#FC4C24",  # Red
                3: "#E86BF8",  # Purple
                4: "#F5D311",  # Yellow
                5: "#00BFAE"  # Teal
            }
        }