import numpy as np
import math
import random
from scipy import stats

def crossover(parent1, parent2):
    # Single-point crossover
    point = random.randint(1, len(parent1) - 1)
    child1 = np.concatenate((parent1[:point], parent2[point:]))
    child2 = np.concatenate((parent2[:point], parent1[point:]))
    return child1, child2

def mutate(individual, mutation_rate=0.2):
    # Mutation by adding a small value
    for i in range(len(individual)):
        if random.random() < mutation_rate:
            individual[i] += np.random.normal(0, 0.1)
            # Ensure the mutated weight is within bounds
            individual[i] = min(max(individual[i], 0), 1)
    return individual


class Player:
    def __init__(self, true_rating):
        self.rating = true_rating
        self.game_rating = 800
        self.n_games_played = 0
        
    def setRating(self, rating):
        self.rating = rating
        
    def getRating(self):
        return self.rating
    
    def playAGame(self, opposition, weights):
        n_free_squares = 64
        modelMean = 1700
        modelSD = 300
        
        opposition_rating = opposition.getRating()
        
        P_player_has_bad_game = 100/self.rating
        P_opposition_has_bad_game = 100/opposition_rating
        
        random_value_1 = random.random()
        player_has_bad_game = (random_value_1 <= P_player_has_bad_game)
        
        random_value_2 = random.random()
        opposition_has_bad_game = (random_value_2 <= P_opposition_has_bad_game)
        
        winner_pf = 0
        
        winner = player
        
        if (player_has_bad_game and opposition_has_bad_game) or (not player_has_bad_game and not opposition_has_bad_game):
            if self.rating < opposition_rating:
                winner = opposition
                winner_pf = opposition_rating/(self.rating + opposition_rating)
            else:
                winner_pf = self.rating/(self.rating + opposition_rating)
        
        else:
            if self.rating > opposition_rating:
                if not player_has_bad_game:
                    winner_pf = 1.2*self.rating/(self.rating + opposition_rating)
                else:
                    delta_p = self.rating - opposition_rating
                    P_opposition_wins = 1
                    if delta_p > 10: 
                        P_opposition_wins = 100/(delta_p)**2
                    
                    random_value = random.random()
                    if random_value <= P_opposition_wins:
                        if P_opposition_wins <= 0.25:
                            winner_pf = 0.5 + P_opposition_wins
                        else:
                            winner_pf = 0.25 + P_opposition_wins

            elif self.rating == opposition_rating:
                if not player_has_bad_game:
                    winner_pf = 1.05*self.rating/(self.rating + opposition_rating)
                else:
                    winner = opposition
                    winner_pf = 1.05*opposition_rating/(self.rating + opposition_rating)
                    
            else:
                if not player_has_bad_game:
                    delta_p = opposition_rating - self.rating
                    P_player_wins = 1
                    if delta_p > 10: 
                        P_player_wins = 100/(delta_p)**2
                    
                    random_value = random.random()
                    if random_value <= P_player_wins:
                        if P_player_wins <= 0.25:
                            winner_pf = 0.5 + P_player_wins
                        else:
                            winner_pf = 0.25 + P_player_wins
                else:
                    winner = opposition
                    delta_p = self.rating - opposition_rating
                    P_opposition_wins = 1
                    winner_pf = 1.2*opposition_rating/(self.rating + opposition_rating)
                    
                    
        winner_squares = math.ceil(n_free_squares * winner_pf)
        
        duration = 20*60*modelMean/self.rating # in seconds
        if winner == opposition:
            duration = 20*60*modelMean/opposition_rating
            
        random_value_complexity = random.random()
        if random_value_complexity <= 0.25:
            puzzle_complexity = 1
        elif 0.25 < random_value_complexity <= 0.5:
            puzzle_complexity = 2
        elif 0.5 < random_value_complexity <= 0.75:
            puzzle_complexity = 3
        else:
            puzzle_complexity = 4

            
        delta_rating = abs(self.game_rating - opposition.game_rating)
        
        if winner == player:
            player_squares = winner_squares
            opposition_squares = n_free_squares - winner_squares
        else:
            opposition_squares = winner_squares
            player_squares = n_free_squares - winner_squares
            
        delta_1 = 1
        delta_2 = -1
        if self.game_rating < opposition.game_rating:
            delta_1 = -1
            delta_2 = 1
            
        omega_p_1 = 10**(delta_1 * (self.game_rating - opposition.game_rating) * (player_squares - opposition_squares) / 6400)
        omega_p_2 = 10**(delta_2 * (opposition.game_rating - self.game_rating) * (opposition_squares - player_squares) / 6400)
        
        player_rating = weights[0] + weights[1]*puzzle_complexity + weights[2]*duration +  weights[3]*self.n_games_played + weights[4]*omega_p_1
        opposition_rating = weights[0] + weights[1]*puzzle_complexity + weights[2]*duration +  weights[3]*opposition.n_games_played + weights[4]*omega_p_2
        
        if not math.isnan(player_rating) and not math.isnan(opposition_rating):
            self.game_rating = player_rating
            opposition.game_rating = opposition_rating

            self.n_games_played += 1
            opposition.n_games_played += 1
            


# Initialize players with true ratings from a normal distribution
true_ratings = np.random.normal(1700, 300, 5000)
calculated_ratings = np.full(5000, 800)

# players = [new Player(i) for i in true_ratings]

# Define the number of factors and the population size
num_factors = 5  # For the five factors you mentioned
population_size = 100

# Initialize the population with random weights for each factor
# Here we're using a simple uniform distribution between 0 and 1 for initialization
population = np.random.rand(population_size, num_factors)

number_of_generations = 50

# Function to evaluate the fitness of the weights
def evaluate_fitness(players):
    data = np.array([player.game_rating for player in players])
    true_date = np.array([player.rating for player in players])
    
    total_error = sum((player.game_rating - player.rating) ** 2 for player in players)
    mse = total_error / len(players)
    return mse





# Parameters for convergence criteria
fitness_threshold = 0.001
convergence_counter = 0
max_convergence_stagnation = 10
previous_best_fitness = None


# Genetic algorithm main loop
for generation in range(number_of_generations):
    print(generation)
    # Simulate games for each set of weights
    fitness_scores = []
    for weights in population:
        players = [Player(i) for i in true_ratings]
        for player in players:
            while player.n_games_played < 100:
                i = int(random.random()*5000)
                while players[i] == player:
                    i = int(random.random()*5000)
                player.playAGame(players[i], weights)
                
        # Evaluate fitness for each set of weights
        fitness_scores.append(evaluate_fitness(players))
        
    current_best_fitness = min(fitness_scores)

    if previous_best_fitness is not None:
        fitness_change = abs(current_best_fitness - previous_best_fitness)

        if fitness_change < fitness_threshold:
            convergence_counter += 1
        else:
            convergence_counter = 0

        if convergence_counter >= max_convergence_stagnation:
            print(f"Algorithm converged after {generation} generations.")
            break
    else:
        fitness_change = None

    previous_best_fitness = current_best_fitness
    
    
    # Selection (this example uses simple truncation selection for illustration)
    selected_indices = np.argsort(fitness_scores)[:population_size // 2]
    selected = population[selected_indices]

    # Crossover and Mutation to create the new population
    new_population = []
    while len(new_population) < population_size:
        parents = []
        choice = int(random.random()*len(selected))
        parents.append(selected[choice])

        choice2 = int(random.random()*len(selected))
        while choice2 == choice:
            choice2 = int(random.random()*len(selected))
        parents.append(selected[choice2])
        
        child1, child2 = crossover(parents[0], parents[1])
        new_population.append(mutate(child1))
        if len(new_population) < population_size:
            new_population.append(mutate(child2))

    population = np.array(new_population)


final_fitness_scores = []
players = [Player(i) for i in true_ratings]
for weights in population:
    for player in players:
        while player.n_games_played < 100:
            i = int(random.random()*5000)
            while players[i] == player:
                i = int(random.random()*5000)
            player.playAGame(players[i], weights)

    # Evaluate fitness for each set of weights
    final_fitness_scores = [evaluate_fitness(players) for weights in population]
    

# Best weights after all generations are considered the solution

# Find the index of the individual with the best (lowest) fitness score
best_index = np.argmin(final_fitness_scores)

# Extract the best set of weights
best_weights = population[best_index]

print("Best weights found:", best_weights)