import fastify from 'fastify'
import {serializerCompiler,validatorCompiler,ZodTypeProvider} from 'fastify-type-provider-zod'

const server = fastify({
    logger:true
}).withTypeProvider<ZodTypeProvider>();

server.setSerializerCompiler(serializerCompiler);
server.setValidatorCompiler(validatorCompiler)