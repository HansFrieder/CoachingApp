from django.db import models
from .config import Config

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

    def __str__(self):
        return self.name