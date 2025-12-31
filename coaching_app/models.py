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
            "color": config.colors["skills"].get(level2_main[0][0], "#FFFFFF"), # Color
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
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Training on {self.date}"
    
    def fill_drills(self):
        """
        Fill the drills ManyToMany field based on the actions JSONField.
        """

        drill_ids = [action['drill'] for action in self.actions if action['drill'] != 'custom']
        drills = Drill.objects.filter(id__in=drill_ids)
        self.drills.set(drills)
    
    def save(self, *args, **kwargs):
        """
        Trigger: Saving a Training instance.
        Only call fill_drills if this is not a creation (i.e., if the instance already exists).
        """
        if self.pk:  # Wird nur aufgerufen, wenn das Objekt bereits existiert
            self.fill_drills()

        super().save(*args, **kwargs)
