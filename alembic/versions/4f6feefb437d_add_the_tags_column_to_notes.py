"""add the tags column to notes

Revision ID: 4f6feefb437d
Revises: 73d734b72271
Create Date: 2026-03-31 13:38:24.855212

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '4f6feefb437d'
down_revision: Union[str, Sequence[str], None] = '73d734b72271'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'notes',
        sa.Column(
            'tags',
            postgresql.ARRAY(sa.String()),
            nullable=False,
            server_default='{}',
        )
    )
    pass


def downgrade() -> None:
    op.drop_column('notes', 'tags')
    pass
