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
            'skill_level1': {
                1: "Basics",
                2: "Technik",
                3: "Taktik",
                4: "Weitere"
            },
            'skill_level2': {
                1: "Offense", 
                2: "Defense", 
                3: "Transition", 
                4: "Fitness", 
                5: "Weitere"
            },
            'intensity': {
                1: "nicht intensiv",
                2: "weniger intensiv",
                3: "intensiv",
                4: "sehr intensiv",
                5: "extrem intensiv"
            },
            'difficulty': {
                1: "sehr einfach",
                2: "eher einfach",
                3: "schwierig",
                4: "sehr schwierig",
                5: "extrem schwierig"
            }
        }