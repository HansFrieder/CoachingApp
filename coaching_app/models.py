from django.db import models
from .config import Config
from collections import Counter

config = Config()

class Skill(models.Model):
    """
    Model representing a skill in the coaching app.
    """

    name = models.CharField(max_length=100)
    level1 = models.IntegerField(choices=config.model_choices['skill_levels'][1], default=1)
    level2 = models.IntegerField(choices=config.model_choices['skill_levels'][2], default=1)

    def __str__(self):
        return self.name
    
class Drill(models.Model):
    """
    Model representing a drill in the coaching app.
    """

    name = models.CharField(max_length=100)
    description = models.TextField()
    skills = models.ManyToManyField(Skill, related_name='drills')
    intensity = models.IntegerField(choices=config.model_choices['drill_scales']['intensity'], default=1)
    difficulty = models.IntegerField(choices=config.model_choices['drill_scales']['difficulty'], default=1)
    stats = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.name
    
    def calc_stats(self):
        """        
        Calculate statistics for the drill, especially for visualization in frontend.
        """

        # Calculate Skill Stats
        level2_values = self.skills.values_list('level2', flat=True)
        level2_value_counts = Counter(level2_values)
        level2_main = level2_value_counts.most_common(1) if level2_values else None 
        level2_dist = {tuple[0]: 0 for tuple in config.model_choices['skill_levels'][2]}
        level2_dist.update(dict(level2_value_counts))

        # Dict für Json Feld
        self.stats = {
            "color": config.colors["skills"]["soft"].get(level2_main[0][0], "#FFFFFF"), # Color
            "level2_distr": list(level2_dist.values()), # Verteilung Level 2 als Liste ("Offense", "Defense", etc.)
            "intensity": self.intensity, # Intensität
            "difficulty": self.difficulty, # Schwierigkeit
        }

    def save(self, *args, **kwargs):
        """
        Trigger: Saving a Drill instance.
        Only call calc_stats if this is not a creation (i.e., if the instance already exists).
        """
        if self.pk:  # Wird nur aufgerufen, wenn das Objekt bereits existiert
            self.calc_stats()

        super().save(*args, **kwargs)

class Training(models.Model):
    """
    Model representing a training session in the coaching app.
    """

    name = models.CharField(max_length=100, blank=True)
    date = models.DateField()
    player_count = models.IntegerField(default=10)
    duration = models.DurationField()
    actions = models.JSONField(default=dict, blank=True)
    """
    actions = [{
        "drill": drill_id or "custom",
        "duration": default 10 minutes,
        "description": "Custom description if drill is 'custom'"
    }]
    """
    drills = models.ManyToManyField(Drill, related_name='trainings')
    description = models.TextField(blank=True)
    stats = models.JSONField(default=dict, blank=True)
    checked = models.BooleanField(default=False)

    def __str__(self):
        return f"Training on {self.date}"
    
    def fill_drills(self):
        """
        Fill the drills ManyToMany field based on the actions JSONField.
        """

        drill_ids = [action['drill'] for action in self.actions if 'custom' not in action['drill']]
        drills = Drill.objects.filter(id__in=drill_ids)
        self.drills.set(drills)
    
    def calc_stats(self):
        """        
        Calculate statistics for the drill, especially for visualization in frontend.
        """

        # Alle Skill-Verteilungen der enthaltenen Drills sammeln
        action_stats = []
        gew_list = []
        netto_duration = self.duration.total_seconds() / 60  # Dauer in Minuten
        for action in self.actions:
            
            # Custom Drills
            if 'custom' in action['drill']:
                action_stats.append({
                    "level2_distr": [0, 0, 0, 0, 1],
                    "intensity": None,
                    "difficulty": None
                })
                netto_duration -= int(action["duration"])  # Netto-Dauer anpassen
                gew_list.append(int(action["duration"]))  # Gewichtung nach Dauer in Minuten
            
            # DB Drills
            else:
                drill = Drill.objects.get(pk=action['drill'])
                action_stats.append(drill.stats)
                gew_list.append(int(action["duration"]))  # Gewichtung nach Dauer in Minuten

        # Gesamtverteilung errechnen
        for idx, action_stats_dict in enumerate(action_stats):
            
            # Normalisieren
            total = sum(action_stats_dict["level2_distr"])
            if total > 0:
                action_stats_dict["level2_distr"] = [v / total for v in action_stats_dict["level2_distr"]]
            
            # Gewichten
            action_stats_dict["level2_distr"] = [v * gew_list[idx] for v in action_stats_dict["level2_distr"]]
            action_stats_dict["intensity"] = int(action_stats_dict["intensity"]) * gew_list[idx] if action_stats_dict["intensity"] is not None else None
            action_stats_dict["difficulty"] = int(action_stats_dict["difficulty"]) * gew_list[idx] if action_stats_dict["difficulty"] is not None else None

        # Summieren
        level2_dist = [0, 0, 0, 0, 0]
        intensity = 0
        difficulty = 0
        for action_stats_dict in action_stats:

            # Level2 Verteilung
            for i in range(len(action_stats_dict["level2_distr"])):
                level2_dist[i] += action_stats_dict["level2_distr"][i]

            # Intensität und Schwierigkeit mitteln
            intensity += action_stats_dict["intensity"] if action_stats_dict["intensity"] is not None else 0
            difficulty += action_stats_dict["difficulty"] if action_stats_dict["difficulty"] is not None else 0

        # Normalisieren
        total_dist = sum(level2_dist)
        if total_dist > 0:
            level2_dist = [level2_dist[i] / total_dist for i in range(len(level2_dist))]

        # Dict für Json Feld
        self.stats = {
            "color": config.colors["finished_training"].get(self.checked, "#FFFFFF"), # Color
            "level2_distr": level2_dist, # Verteilung Level 2 als Liste ("Offense", "Defense", etc.)
            "intensity": intensity / netto_duration if netto_duration > 0 else 0, # Intensität
            "difficulty": difficulty / netto_duration if netto_duration > 0 else 0, # Schwierigkeit
        }

    def save(self, *args, **kwargs):
        """
        Trigger: Saving a Training instance.
        Only call fill_drills if this is not a creation (i.e., if the instance already exists).
        """
        if self.pk:  # Wird nur aufgerufen, wenn das Objekt bereits existiert
            self.fill_drills()
            self.name = self.date.strftime("%Y-%m-%d")
            self.calc_stats()

        super().save(*args, **kwargs)
