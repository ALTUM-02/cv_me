import graphene
from accounts.schema import Query as AccountsQuery, Mutation as AccountsMutation
from cv_builder.schema import Query as CVQuery, Mutation as CVMutation


class Query(AccountsQuery, CVQuery, graphene.ObjectType):
    pass


class Mutation(AccountsMutation, CVMutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
