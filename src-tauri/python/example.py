# -*- coding: utf-8 -*-

"""
-------------------------------------------------------------------------------
Name:Agent.py
Model description: <description>
Authors:capocchi_l
Organization:<your organization>
Current date & time: 2023-04-24 15:01:55.197461
License:GPL v3.0
-------------------------------------------------------------------------------
"""


# Specific import ------------------------------------------------------------


# Model class ----------------------------------------------------------------


from DomainInterface.DomainBehavior import DomainBehavior
from DomainInterface.Object import Message


class Agent(DomainBehavior):

    ''' DEVS Class for the model Agent
 '''

    def __init__(self):
        ''' Constructor.
        '''
        DomainBehavior.__init__(self)

        self.initPhase('IDLE', INFINITY)

    def extTransition(self, *args):
        ''' DEVS external transition function.
        '''
        return self.getState()

    def outputFnc(self):
        ''' DEVS output function.
        '''
        return {}

    def intTransition(self):
        ''' DEVS internal transition function.
        '''
        return self.getState()

    def timeAdvance(self):
        ''' DEVS Time Advance function.
        '''
        return self.getSigma()

    def finish(self, msg):
        ''' Additional function which is lunched just before the end of the simulation.
        '''
        pass

        """

         focntion du dnl:
            self.passivate()



            self.holdIn('<phase>',<sigma>)


            self.peek(self.IPorts[0], *args) sur le port 0




            return self.poke(self.OPorts[0], Message(<>, self.timeNext)) surl le port 0"""
