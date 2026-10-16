import pymysql
pymysql.install_as_MySQLdb()

# Safe version bypass for MySQL compatibility
from django.db.backends.base.base import BaseDatabaseWrapper
BaseDatabaseWrapper.check_database_version_supported = lambda self: None

# Python 3.14 compatibility patch for Django templates
from django.template.context import BaseContext

def _base_context_copy(self):
    duplicate = self.__class__.__new__(self.__class__)
    duplicate.__dict__.update(self.__dict__)
    duplicate.dicts = self.dicts[:]
    return duplicate

BaseContext.__copy__ = _base_context_copy