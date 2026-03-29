import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker



engine = create_engine(os.environ.get('DATABASE_URL'))
SessionLocal = sessionmaker(autocommit=False,
                            autoflush=False,
                            bind=engine)
