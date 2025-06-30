from django.db import models

class Skill(models.Model):
    """
    Model representing a skill in the coaching app.
    """
    levels = {
        1: [(1, "Basics"), (2, "Technik"), (3, "Taktik"), (4, "Weitere")],
        2: [(1, "Offense"), (2, "Defense"), (3, "Transition"), (4, "Fitness"), (5, "Weitere")],
    }

    name = models.CharField(max_length=100)
    level1 = models.CharField(max_length=50, choices=[(level[0], level[1]) for level in levels[1]], default="Basics")
    level2 = models.CharField(max_length=50, choices=[(level[0], level[1]) for level in levels[2]], default="Offense")

    def __str__(self):
        return self.name