# Generated by Django 2.1.7 on 2019-08-30 10:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('curate', '0054_add_original_meta_research_article_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='article',
            name='reporting_standards_type',
            field=models.CharField(blank=True, choices=[('BASIC_4_7_RETROACTIVE', 'Basic 4/Basic 7 (retroactive)'), ('BASIC_4_AT_SUBMISSION', 'Basic-4 (at submission; PSCI, 2014)'), ('CONSORT_SPI', 'CONSORT-SPI (2018)'), ('CONSORT', 'CONSORT (2010)'), ('JARS', 'JARS (2018)'), ('STROBE', 'STROBE (2007)'), ('ARRIVE', 'ARRIVE (2010)'), ('NATURE_NEUROSCIENCE', 'Nature Neuroscience (2015)'), ('MARS', 'MARS (2018)'), ('PRISMA', 'PRISMA (2009)'), ('PRISMA_P', 'PRISMA-P (2015)')], default='BASIC_4_7_RETROACTIVE', max_length=255, null=True),
        ),
    ]