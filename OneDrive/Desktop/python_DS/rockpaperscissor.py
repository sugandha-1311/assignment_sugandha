import random

def get_choices():
    player_choice = input("Enter your choice(rock,paper,scissor): ")
    computer_choice = random.choice(["rock","paper","scissor"])
    choices = {"player": player_choice, "computer": computer_choice}

    return choices

def check_win(player , computer):
    print("You chose " + player , "Computer chose " + computer)
    if player == computer:
        print("It's a tie!")
    elif player == "rock" and computer == "paper":
        print("computer wins!")
    elif player == "scissor" and computer == "paper":
        print("You win!")
    elif player == "paper" and computer == "rock":
        print("You win!")
    elif player == "scissor" and computer == "rock":
        print("computer wins!")
    elif player == "rock" and computer == "scissor":
        print("You win!")
    elif player == "paper" and computer == "scissor":
        print("computer wins!")

    return None

choices = get_choices()
print(choices)
check_win(choices["player"], choices["computer"])




