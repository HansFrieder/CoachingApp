# Configuration for the coaching app

config_dict = {
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
    }]
}