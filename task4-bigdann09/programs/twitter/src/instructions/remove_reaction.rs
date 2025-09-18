//-------------------------------------------------------------------------------
///
/// TASK: Implement the remove reaction functionality for the Twitter program
///
/// Requirements:
/// - Verify that the tweet reaction exists and belongs to the reaction author
/// - Decrement the appropriate counter (likes or dislikes) on the tweet
/// - Close the tweet reaction account and return rent to reaction author
///
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;

use crate::errors::TwitterError;
use crate::states::*;

pub fn remove_reaction(ctx: Context<RemoveReactionContext>) -> Result<()> {
    let tweet: &mut Account<Tweet> = &mut ctx.accounts.tweet;

    match ctx.accounts.tweet_reaction.reaction {
        ReactionType::Like => {
            require!(tweet.likes >= u64::MIN, TwitterError::MinLikesReached);
            tweet.likes = tweet.likes - 1;
        }
        ReactionType::Dislike => {
            require!(tweet.dislikes >= u64::MIN, TwitterError::MinDislikesReached);
            tweet.dislikes = tweet.dislikes - 1;
        }
    }

    Ok(())
}

#[derive(Accounts)]
pub struct RemoveReactionContext<'info> {
    #[account(mut)]
    pub reaction_author: Signer<'info>,
    #[account(
        mut,
        close=reaction_author,
        seeds=[
            TWEET_REACTION_SEED.as_bytes(),
            reaction_author.key().as_ref(),
            tweet.key().as_ref()
        ],
        bump=tweet_reaction.bump
    )]
    pub tweet_reaction: Account<'info, Reaction>,
    #[account(
        mut,
        seeds=[
            tweet.topic.as_ref(),
            TWEET_SEED.as_bytes(),
            tweet.tweet_author.as_ref(),
        ],
        bump=tweet.bump
    )]
    pub tweet: Account<'info, Tweet>,
}
